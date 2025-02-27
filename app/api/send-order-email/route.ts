import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sophie.summer.shop@gmail.com",
    pass: "cqkq dlzs fktq ebsa",
  },
})

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 segundo

export async function sendOrderEmail({ formData, cart, total }) {
  console.log("Preparing to send emails for order:", {
    customer: formData.email,
    items: cart.length,
    total,
  })

  const adminMailOptions = {
    from: "sophie.summer.shop@gmail.com",
    to: "sophie.summer.shop@gmail.com",
    subject: "Nueva orden de Sophie Summer",
    html: `
      <h1>Nueva orden</h1>
      <h2>Detalles del cliente:</h2>
      <p>Nombre: ${formData.name}</p>
      <p>Email: ${formData.email}</p>
      <p>Dirección: ${formData.address}</p>
      <p>Teléfono: ${formData.phone}</p>
      
      <h2>Detalles del pedido:</h2>
      <ul>
        ${cart
          .map(
            (item: any) => `
          <li>
            ${item.name} (Talla: ${item.selectedSize}) - Cantidad: ${item.quantity} - Precio: $${(
              item.price * item.quantity
            ).toFixed(2)}
          </li>
        `,
          )
          .join("")}
      </ul>
      <p><strong>Total: $${total.toFixed(2)}</strong></p>
    `,
  }

  const customerMailOptions = {
    from: "sophie.summer.shop@gmail.com",
    to: formData.email,
    subject: "Confirmación de tu orden - Sophie Summer",
    html: `
      <h1>¡Gracias por tu compra!</h1>
      <p>Tu orden fue confirmada. En breve uno de nuestros vendedores se contactará contigo para terminar de confirmar la orden, coordinar el pago (si correcponde) y coordinar el envio.</p>
      
      <h2>Resumen de tu pedido:</h2>
      <ul>
        ${cart
          .map(
            (item: any) => `
          <li>
            ${item.name} (Talla: ${item.selectedSize}) - Cantidad: ${item.quantity} - Precio: $${(
              item.price * item.quantity
            ).toFixed(2)}
          </li>
        `,
          )
          .join("")}
      </ul>
      <p><strong>Total: $${total.toFixed(2)}</strong></p>
      
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p>2616977056</p>
      <p>¡Gracias por elegir Sophie Summer!</p>
    `,
  }

  async function sendMailWithRetry(mailOptions, retryCount = 0) {
    try {
      await transporter.sendMail(mailOptions)
      console.log(`Email sent successfully to ${mailOptions.to}`)
      return true
    } catch (error) {
      console.error(`Error sending email to ${mailOptions.to}:`, error)

      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`)
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
        return sendMailWithRetry(mailOptions, retryCount + 1)
      }

      throw error
    }
  }

  try {
    // Enviar ambos emails en paralelo
    await Promise.all([sendMailWithRetry(adminMailOptions), sendMailWithRetry(customerMailOptions)])

    console.log("All emails sent successfully")
    return true
  } catch (error) {
    console.error("Failed to send one or more emails:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    console.log("Received POST request for sending order email")
    const { formData, cart, total } = await request.json()
    console.log("Request data:", { formData, cart, total })

    await sendOrderEmail({ formData, cart, total })
    console.log("Emails sent successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST handler:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send emails", details: error.message },
      { status: 500 },
    )
  }
}

