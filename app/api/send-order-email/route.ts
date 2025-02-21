import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "alvarogonzalez7070@gmail.com",
    pass: "pvcz objb ldvd cito",
  },
})

export async function POST(request: Request) {
  const { formData, cart, total } = await request.json()

  const mailOptions = {
    from: "alvarogonzalez7070@gmail.com",
    to: "alvarogonzalez408@gmail.com",
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
            ${item.name} (Talla: ${item.selectedSize}) - Cantidad: ${item.quantity} - Precio: $${(item.price * item.quantity).toFixed(2)}
          </li>
        `,
          )
          .join("")}
      </ul>
      <p><strong>Total: $${total.toFixed(2)}</strong></p>
    `,
  }

  try {
    console.log("Attempting to send email...")
    await transporter.sendMail(mailOptions)
    console.log("Email sent successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email", error)
    return NextResponse.json({ success: false, error: "Failed to send email", details: error.message }, { status: 500 })
  }
}

