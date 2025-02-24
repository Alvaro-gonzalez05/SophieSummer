import { NextResponse } from "next/server"
import mercadopago from "mercadopago"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const { action, data } = JSON.parse(body)

    if (action === "payment.created" || action === "payment.updated") {
      const paymentId = data.id
      const payment = await mercadopago.payment.findById(paymentId)

      if (payment.body.status === "approved") {
        const orderEmail = payment.body.external_reference
        const orderItems = payment.body.additional_info.items

        // Here you would typically update your database with the order information

        // Send confirmation email
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formData: { email: orderEmail },
            cart: orderItems,
            total: payment.body.transaction_amount,
          }),
        })

        // Update stock
        await fetch("/api/update-stock", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ updatedProducts: orderItems }),
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing Mercado Pago webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

