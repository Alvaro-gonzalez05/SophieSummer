import { NextResponse } from "next/server"
import { sendOrderEmail } from "../send-order-email/route"
import { updateStock } from "../update-stock/route"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const data = JSON.parse(body)

    // Verify the payment status
    if (data.type === "payment" && data.data.status === "approved") {
      const paymentId = data.data.id

      // Fetch payment details from Mercado Pago API
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      })

      if (!paymentResponse.ok) {
        throw new Error("Failed to fetch payment details from Mercado Pago")
      }

      const paymentData = await paymentResponse.json()

      // Extract order details from the payment data
      const formData = {
        name: paymentData.payer.first_name + " " + paymentData.payer.last_name,
        email: paymentData.payer.email,
        address: paymentData.payer.address?.street_name || "N/A",
        phone: paymentData.payer.phone?.number || "N/A",
      }

      const cart = paymentData.additional_info.items.map((item) => ({
        name: item.title,
        price: Number.parseFloat(item.unit_price),
        quantity: Number.parseInt(item.quantity),
        selectedSize: item.category_id, // Assuming you store the size in category_id
      }))

      const total = Number.parseFloat(paymentData.transaction_amount)

      // Update stock
      await updateStock({ updatedProducts: cart })

      // Send order confirmation email
      await sendOrderEmail({ formData, cart, total })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing Mercado Pago webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

