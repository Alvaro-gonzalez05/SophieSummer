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
          const cart = paymentData.additional_info.items.map((item) => ({
            id: extractProductId(item.id || item.title), // Intentar usar el ID primero
            name: item.title,
            price: Number(item.unit_price),
            quantity: Number(item.quantity),
            selectedSize: extractSize(item.title),
          }))

          const total = Number(paymentData.transaction_amount)

          // Primero verificar el stock
          try {
            const stockCheckResponse = await fetch("/api/check-stock", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ cart }),
            })

            if (!stockCheckResponse.ok) {
              throw new Error("Stock check failed")
            }

            // Si el stock está OK, actualizar stock
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

    // Siempre retornar 200 para Mercado Pago
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing Mercado Pago webhook:", error)
    // Mercado Pago espera un 200 incluso en caso de error
    return NextResponse.json({
      success: false,
      error: "Failed to process webhook",
      details: error.message,
    })
  }
}

// Función mejorada para extraer ID del producto
function extractProductId(text: string): number {
  // Primero intentar extraer un ID numérico directo
  if (!isNaN(Number(text))) {
    return Number(text)
  }

  // Luego buscar un número en el texto
  const match = text.match(/(\d+)/)
  if (match) {
    return Number(match[1])
  }

  // Si no se encuentra un ID, retornar 0 o lanzar un error
  console.error(`Could not extract product ID from: ${text}`)
  return 0
}

// Función mejorada para extraer talla
function extractSize(title: string): string {
  // Buscar un patrón común para tallas
  const sizePatterns = [/talla[:\s]+([^\s)]+)/i, /size[:\s]+([^\s)]+)/i, /$$([^$$]+)\)/, /\[([^\]]+)\]/]

  for (const pattern of sizePatterns) {
    const match = title.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // Si no se encuentra la talla, retornar "U" o un valor por defecto
  return "U"
}

