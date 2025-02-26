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

      // Only process approved payments
      if (paymentData.status === "approved") {
        console.log("Payment approved, processing order")

        // Extract order details from the payment data
        const formData = {
          name: paymentData.payer.first_name + " " + paymentData.payer.last_name,
          email: paymentData.payer.email,
          address: paymentData.payer.address?.street_name || "N/A",
          phone: paymentData.payer.phone?.number || "N/A",
        }

        // Make sure additional_info and items exist
        if (paymentData.additional_info && paymentData.additional_info.items) {
          const cart = paymentData.additional_info.items.map((item) => ({
            id: extractProductId(item.title), // Add a function to extract product ID from title
            name: item.title,
            price: Number.parseFloat(item.unit_price),
            quantity: Number.parseInt(item.quantity),
            selectedSize: extractSize(item.title), // Add a function to extract size from title
          }))

          const total = Number.parseFloat(paymentData.transaction_amount)

          // Update stock
          try {
            console.log("Updating stock for items:", JSON.stringify(cart))
            await updateStock({ updatedProducts: cart })
            console.log("Stock updated successfully")
          } catch (stockError) {
            console.error("Error updating stock:", stockError)
          }

          // Send order confirmation email
          try {
            console.log("Sending order confirmation email")
            await sendOrderEmail({ formData, cart, total })
            console.log("Email sent successfully")
          } catch (emailError) {
            console.error("Error sending email:", emailError)
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
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

// Helper function to extract product ID from title
function extractProductId(title: string): number {
  // This is a placeholder. You'll need to implement this based on how your product titles are formatted
  // For example, if your title format is "Product Name (Size) #123", you might extract the ID with regex
  const match = title.match(/#(\d+)/)
  return match ? Number.parseInt(match[1]) : 0
}

// Helper function to extract size from title
function extractSize(title: string): string {
  // This is a placeholder. You'll need to implement this based on how your product titles are formatted
  // For example, if your title format is "Product Name (Size)", you might extract the size with regex
  const match = title.match(/$$([^)]+)$$/)
  return match ? match[1] : "N/A"
}

