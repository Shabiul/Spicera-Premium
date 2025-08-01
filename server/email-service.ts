import nodemailer from 'nodemailer';
import { Order, OrderItem, Product } from '../shared/schema';

interface CartItemWithProduct {
  id: string;
  sessionId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

interface OrderEmailData {
  order: Order;
  cartItems: CartItemWithProduct[];
}

// Create transporter for sending emails
const createTransporter = () => {
  // For development, use Ethereal Email (test service)
  // For production, use a proper email service like SendGrid, AWS SES, etc.
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Use Ethereal Email for testing (creates test accounts automatically)
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Generate HTML email template for order confirmation
const generateOrderEmailHTML = (data: OrderEmailData): string => {
  const { order, cartItems } = data;
  const subtotal = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SpiceCraft Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; text-align: center; }
        .order-details { background: #f9f9f9; padding: 20px; margin: 20px 0; }
        .item { border-bottom: 1px solid #ddd; padding: 10px 0; }
        .total { background: #333; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌶️ SpiceCraft</h1>
          <h2>Order Confirmation</h2>
          <p>Order ID: #${order.id.slice(-8)}</p>
        </div>
        
        <div class="order-details">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${order.customername}</p>
          <p><strong>Email:</strong> ${order.customeremail}</p>
          ${order.customerphone ? `<p><strong>Phone:</strong> ${order.customerphone}</p>` : ''}
          <p><strong>Shipping Address:</strong><br>${order.shippingaddress}</p>
        </div>
        
        <div class="order-details">
          <h3>Order Items</h3>
          ${cartItems.map(item => `
            <div class="item">
              <strong>${item.product.name}</strong><br>
              <small>${item.product.description}</small><br>
              Quantity: ${item.quantity} × ₹${item.product.price} = ₹${(parseFloat(item.product.price) * item.quantity).toFixed(0)}
            </div>
          `).join('')}
          
          <div style="margin-top: 20px;">
            <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(0)}</p>
            <p><strong>Shipping:</strong> ${shipping === 0 ? 'FREE' : `₹${shipping.toFixed(0)}`}</p>
            <div class="total">
              Total: ₹${total.toFixed(0)}
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing SpiceCraft!</p>
          <p>Your authentic spice blends will be carefully prepared and shipped to you.</p>
          <p>For any questions, please contact us at support@spicecraft.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (data: OrderEmailData): Promise<void> => {
  try {
    const transporter = createTransporter();
    const htmlContent = generateOrderEmailHTML(data);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@spicecraft.com',
      to: 'shabiulhasnain33@gmail.com', // Send to the specified email
      cc: data.order.customeremail, // Also send a copy to the customer
      subject: `SpiceCraft Order Confirmation - #${data.order.id.slice(-8)}`,
      html: htmlContent
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    // Don't throw error to prevent order creation from failing
  }
};