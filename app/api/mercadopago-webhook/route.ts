import { NextResponse } from "next/server"
import { sendOrderEmail } from "../send-order-email/route"
import { updateStock } from "../update-stock/route"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    console.log("Received webhook:", body)
    const data = JSON.parse(body)

    // Verify the payment status
    if (data.type === "payment" && data.data && data.data.id) {
      const paymentId = data.data.id
      console.log(`Processing payment ID: ${paymentId}`)

      // Fetch payment details from Mercado Pago API
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      })

      if (!paymentResponse.ok) {
        console.error(`Failed to fetch payment details: ${paymentResponse.status}`)
        throw new Error("Failed to fetch payment details from Mercado Pago")
      }

      const paymentData = await paymentResponse.json()
      console.log("Payment data:", JSON.stringify(paymentData))

      // Solo procesar pagos aprobados
      if (paymentData.status === "approved") {
        console.log("Payment approved, processing order")

        // Extraer detalles del comprador
        const formData = {
          name: paymentData.payer.first_name + " " + paymentData.payer.last_name,
          email: paymentData.payer.email,
          address: paymentData.payer.address?.street_name || "N/A",
          phone: paymentData.payer.phone?.number || "N/A",
        }

        // Procesar los items del carrito
        if (paymentData.additional_info && paymentData.additional_info.items) {
          const cart = paymentData.additional_info.items.map((item) => {
            // Extraer ID y tamaño del título
            const titleParts = item.title.split(" - ")
            const sizeMatch = titleParts[1]?.match(/Talla: (.+)/) || ["", "U"]

            return {
              id: Number(item.id), // Usar el ID directamente del item
              name: titleParts[0],
              price: Number(item.unit_price),
              quantity: Number(item.quantity),
              selectedSize: sizeMatch[1],
            }
          })

          const total = Number(paymentData.transaction_amount)

          try {
            // Actualizar stock directamente
            console.log("Updating stock for items:", JSON.stringify(cart))
            await updateStock({ updatedProducts: cart })
            console.log("Stock updated successfully")

            // Enviar emails de confirmación
            console.log("Sending order confirmation emails")
            await sendOrderEmail({ formData, cart, total })
            console.log("Confirmation emails sent successfully")
          } catch (error) {
            console.error("Error processing order:", error)
            // Aún retornamos 200 para Mercado Pago, pero logueamos el error
            return NextResponse.json({
              success: false,
              error: "Error processing order",
              details: error.message,
            })
          }
        } else {
          console.error("Missing additional_info or items in payment data")
        }
      } else {
        console.log(`Payment not approved. Status: ${paymentData.status}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing Mercado Pago webhook:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to process webhook",
      details: error.message,
    })
  }
}

