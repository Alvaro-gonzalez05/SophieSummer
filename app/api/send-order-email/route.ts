import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendOrderEmail({ formData, cart, total }) {
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
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
    from: process.env.EMAIL_USER,
    to: formData.email,
    subject: "Confirmación de tu orden - Sophie Summer",
    html: `
      <h1>¡Gracias por tu compra!</h1>
      <p>Tu orden fue confirmada. En breve uno de nuestros vendedores se contactará contigo para terminar de confirmar la orden y coordinar el pago.</p>
      
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
      <p>¡Gracias por elegir Sophie Summer!</p>
    `,
  }

  await transporter.sendMail(adminMailOptions)
  await transporter.sendMail(customerMailOptions)
}

export async function POST(request: Request) {
  try {
    const { formData, cart, total } = await request.json()
    await sendOrderEmail({ formData, cart, total })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending emails", error)
    return NextResponse.json(
      { success: false, error: "Failed to send emails", details: error.message },
      { status: 500 },
    )
  }
}

