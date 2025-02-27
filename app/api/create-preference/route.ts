import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("Received request")
    const { formData, cart, total } = await request.json()
    console.log("Parsed request data:", { formData, cart, total })

    const items = cart.map((item: any) => ({
      id: item.id.toString(), // Importante: Incluir el ID del producto
      title: `${item.name} - Talla: ${item.selectedSize}`,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      currency_id: "ARS",
      description: `${item.name} - Talla ${item.selectedSize}`,
    }))
    console.log("Mapped items:", items)

    const preference = {
      items,
      payer: {
        name: formData.name,
        email: formData.email,
        phone: {
          number: formData.phone,
        },
        address: {
          street_name: formData.address,
        },
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      },
      auto_return: "approved",
      external_reference: formData.email,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago-webhook`,
      metadata: {
        buyer_name: formData.name,
        buyer_email: formData.email,
        buyer_address: formData.address,
        buyer_phone: formData.phone,
      },
    }
    console.log("Created preference:", preference)

    console.log("Creating Mercado Pago preference")
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Mercado Pago error:", errorData)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Mercado Pago response:", data)

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error("Error creating Mercado Pago preference:", error)
    return NextResponse.json({ error: "Failed to create payment preference" }, { status: 500 })
  }
}

