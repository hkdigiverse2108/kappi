from datetime import datetime, timedelta, timezone
from html import escape

from app.config import settings

# Website brand colours (frontend tailwind.config.js)
EMERALD_DEEP = "#04403B"
EMERALD = "#0A5C55"
EMERALD_SOFT = "#EAF4F2"
GOLD = "#C8962E"
IVORY = "#FBF8F1"
INK = "#0E1F1D"
MUTED = "#5B6B68"

SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif"
SANS = "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif"


def site_url(path: str = "", base: str | None = None) -> str:
    """Link to the website: `base` is the site the customer used (app/utils/site.py); FRONTEND_URL when not known."""
    return f"{(base or settings.FRONTEND_URL).rstrip('/')}{path}"


def newsletter_welcome(base: str | None = None) -> tuple[str, str]:
    """Plain-text and HTML versions of the short email sent when someone subscribes from the footer."""
    shop = site_url("/shop", base)
    home = site_url("/", base)

    text = f"""Hi there,

Thanks for subscribing to KAPEE Enterprise! You'll now get cleaning tips, new launches and product updates in your inbox.

Shop now: {shop}

Team KAPEE Enterprise
"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to KAPEE Enterprise</title>
</head>
<body style="margin:0;padding:0;background:{IVORY};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{IVORY};">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid {EMERALD_SOFT};">
          <tr>
            <td style="background:{EMERALD_DEEP};border-bottom:3px solid {GOLD};padding:14px 24px;">
              <a href="{home}" target="_blank" style="font-family:{SERIF};font-size:16px;font-weight:700;letter-spacing:1px;color:#ffffff;text-decoration:none;">KAPEE ENTERPRISE</a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;font-family:{SANS};">
              <p style="margin:0;font-family:{SERIF};font-size:20px;font-weight:700;color:{INK};">Thanks for subscribing!</p>
              <p style="margin:10px 0 20px;font-size:14px;line-height:1.6;color:{MUTED};">
                You'll now get cleaning tips, new launches and product updates from KAPEE in your inbox.
              </p>
              <a href="{shop}" target="_blank" style="display:inline-block;padding:10px 22px;background:{EMERALD};border-radius:10px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Shop Now &rarr;</a>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px;background:{EMERALD_SOFT};font-family:{SANS};font-size:11px;color:{MUTED};">
              You're receiving this because you subscribed on our website.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return text, html


def _ist(iso: str) -> str:
    """Order time in Indian time, e.g. "26 Oct 2026, 3:22 PM"."""
    when = datetime.fromisoformat(iso).astimezone(timezone(timedelta(hours=5, minutes=30)))
    return when.strftime("%d %b %Y, ") + when.strftime("%I:%M %p").lstrip("0")


def _money(value) -> str:
    return f"₹{int(value):,}"


def _line_amount(item: dict) -> str:
    return "FREE" if item.get("isFreeGift") or not item["price"] else _money(item["price"] * item["quantity"])


def order_confirmation(order: dict, confirmed: bool = False, contact: dict | None = None) -> tuple[str, str]:
    """Plain-text and HTML versions of the order email.

    confirmed=False: sent when the customer places the order.
    confirmed=True: sent when the order is confirmed (status Confirmed).
    """
    number = order["orderNumber"]
    # The website the order was placed on (saved on the order), so the links point to the live site when live
    base = order.get("siteUrl")
    track = site_url(f"/track-order?orderId={number}", base)
    home = site_url("/", base)
    customer = order["customer"]
    name = customer["name"].split(" ")[0]
    pricing = order["pricing"]
    payment = order["payment"]["method"]
    placed = _ist(order["createdAt"])
    total = _money(pricing["total"])
    note = (order.get("customerNote") or "").strip()
    # "Need help?" line: website plus the phone / WhatsApp / email from the Contact Us page
    contact = contact or {}
    website = home.split("://", 1)[-1].rstrip("/")
    help_items = [("Website", website, home)]
    if contact.get("phone"):
        help_items.append(("Call", contact["phone"], f"tel:{''.join(ch for ch in contact['phone'] if ch.isdigit() or ch == '+')}"))
    if contact.get("whatsapp"):
        digits = "".join(ch for ch in contact["whatsapp"] if ch.isdigit())
        help_items.append(("WhatsApp", contact["whatsapp"], f"https://wa.me/{digits}"))
    if contact.get("email"):
        help_items.append(("Email", contact["email"], f"mailto:{contact['email']}"))

    address = order.get("shippingAddress") or {}
    address_lines = [
        customer["name"],
        address.get("line1", ""),
        address.get("line2", ""),
        f"{address.get('city', '')}, {address.get('state', '')} - {address.get('pincode', '')}",
        f"Phone: {customer.get('phone', '')}",
    ]
    address_lines = [line for line in address_lines if line and line.strip(" ,-")]

    if confirmed:
        badge = "ORDER CONFIRMED"
        heading = f"Your order is confirmed, {name}!"
        message = "Good news! Your order is confirmed and is being prepared for dispatch. We'll share the courier details once it ships."
    else:
        badge = "ORDER RECEIVED"
        heading = f"Thanks for your order, {name}!"
        message = "We've received your order and will confirm it shortly. Here are your order details."

    # Price lines that apply to this order
    summary = [("Subtotal", _money(pricing["subtotal"]))]
    if pricing.get("couponDiscount"):
        summary.append((f"Coupon ({pricing.get('couponCode')})", f"-{_money(pricing['couponDiscount'])}"))
    if pricing.get("tierDiscount"):
        summary.append(("Extra Cart Discount", f"-{_money(pricing['tierDiscount'])}"))
    if pricing.get("prepaidDiscount"):
        summary.append(("Prepaid Discount", f"-{_money(pricing['prepaidDiscount'])}"))
    summary.append(("Shipping", "FREE" if not pricing.get("shippingFee") else _money(pricing["shippingFee"])))
    if pricing.get("codCharge"):
        summary.append(("COD Charge", _money(pricing["codCharge"])))

    # ---------- plain text ----------
    item_text = "\n".join(
        f"- {i['title']}" + (f" ({i['variant']})" if i.get("variant") else "")
        + (" [Free Gift]" if i.get("isFreeGift") else "") + f" x {i['quantity']}: {_line_amount(i)}"
        for i in order["items"]
    )
    summary_text = "\n".join(f"{label}: {value}" for label, value in summary)
    address_text = "\n".join(address_lines)
    note_text = f"\nYour note: {note}\n" if note else ""
    text = f"""Hi {name},

{message}

Order ID: {number}
Order Date: {placed}
Payment: {payment}

ITEMS
{item_text}

{summary_text}
Total: {total}

DELIVERY ADDRESS
{address_text}
{note_text}
Track your order: {track}

Need help?
{chr(10).join(f"{label}: {value}" for label, value, _ in help_items)}

Team KAPEE Enterprise
"""

    # ---------- HTML ----------
    label_style = f"font-family:{SANS};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:{MUTED};"
    cell = f"font-family:{SANS};font-size:13px;color:{INK};"

    def info_cell(label, value):
        return (
            f'<td width="50%" valign="top" style="padding:8px 0;">'
            f'<span style="display:block;font-family:{SANS};font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:{MUTED};">{label}</span>'
            f'<span style="display:block;margin-top:2px;font-family:{SANS};font-size:14px;font-weight:700;color:{EMERALD_DEEP};">{escape(value)}</span>'
            f"</td>"
        )

    info_rows = (
        f"<tr>{info_cell('Order ID', number)}{info_cell('Order Date', placed)}</tr>"
        f"<tr>{info_cell('Payment', payment)}{info_cell('Total', total)}</tr>"
    )

    item_rows = ""
    for i in order["items"]:
        sub = " • ".join(x for x in (i.get("variant"), "Free Gift" if i.get("isFreeGift") else "") if x)
        variant = f'<br><span style="font-size:12px;color:{MUTED};">{escape(sub)}</span>' if sub else ""
        item_rows += (
            f"<tr>"
            f'<td style="padding:10px 0;border-bottom:1px solid {EMERALD_SOFT};{cell}"><strong>{escape(i["title"])}</strong>{variant}</td>'
            f'<td align="center" style="padding:10px 8px;border-bottom:1px solid {EMERALD_SOFT};{cell}">{i["quantity"]}</td>'
            f'<td align="right" style="padding:10px 0;border-bottom:1px solid {EMERALD_SOFT};{cell}font-weight:700;">{_line_amount(i)}</td>'
            f"</tr>"
        )

    summary_rows = "".join(
        f"<tr>"
        f'<td style="padding:4px 0;font-family:{SANS};font-size:13px;color:{MUTED};">{escape(label)}</td>'
        f'<td align="right" style="padding:4px 0;font-family:{SANS};font-size:13px;color:{INK};">{value}</td>'
        f"</tr>"
        for label, value in summary
    )

    head_cell = f"border-bottom:2px solid {EMERALD_SOFT};font-family:{SANS};font-size:11px;font-weight:700;color:{MUTED};"
    note_html = (
        f'<p style="margin:12px 0 0;padding:10px 12px;background:{IVORY};border-left:3px solid {GOLD};'
        f'font-family:{SANS};font-size:13px;line-height:1.5;color:{INK};"><strong>Your note:</strong> {escape(note)}</p>'
        if note
        else ""
    )
    address_html = "<br>".join(escape(line) for line in address_lines)
    help_html = " &nbsp;&bull;&nbsp; ".join(
        f'{label}: <a href="{escape(link)}" target="_blank" style="color:{EMERALD};text-decoration:none;font-weight:600;">{escape(value)}</a>'
        for label, value, link in help_items
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Order {number} {"confirmed" if confirmed else "received"}</title>
</head>
<body style="margin:0;padding:0;background:{IVORY};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{IVORY};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid {EMERALD_SOFT};">

          <!-- Header -->
          <tr>
            <td align="center" style="background:{EMERALD_DEEP};border-bottom:3px solid {GOLD};padding:18px 24px;">
              <a href="{home}" target="_blank" style="font-family:{SERIF};font-size:18px;font-weight:700;letter-spacing:2px;color:#ffffff;text-decoration:none;">KAPEE ENTERPRISE</a>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td align="center" style="padding:28px 28px 8px;">
              <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:{EMERALD_SOFT};font-family:{SANS};font-size:11px;font-weight:700;letter-spacing:1px;color:{EMERALD_DEEP};">{badge}</span>
              <p style="margin:14px 0 0;font-family:{SERIF};font-size:22px;font-weight:700;color:{INK};">{escape(heading)}</p>
              <p style="margin:8px 0 0;font-family:{SANS};font-size:14px;line-height:1.6;color:{MUTED};">{escape(message)}</p>
            </td>
          </tr>

          <!-- Order info -->
          <tr>
            <td style="padding:16px 28px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{IVORY};border:1px solid {EMERALD_SOFT};border-radius:12px;">
                <tr>
                  <td style="padding:8px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{info_rows}</table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items & price -->
          <tr>
            <td style="padding:24px 28px 0;">
              <p style="margin:0 0 6px;{label_style}">Order Summary</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:8px 0;{head_cell}">ITEM</td>
                  <td align="center" style="padding:8px;{head_cell}">QTY</td>
                  <td align="right" style="padding:8px 0;{head_cell}">AMOUNT</td>
                </tr>
                {item_rows}
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
                {summary_rows}
                <tr>
                  <td style="padding:10px 0 0;border-top:1px solid {EMERALD_SOFT};font-family:{SANS};font-size:15px;font-weight:700;color:{INK};">Total</td>
                  <td align="right" style="padding:10px 0 0;border-top:1px solid {EMERALD_SOFT};font-family:{SANS};font-size:18px;font-weight:800;color:{EMERALD_DEEP};">{total}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Address & note -->
          <tr>
            <td style="padding:24px 28px 0;">
              <p style="margin:0 0 6px;{label_style}">Delivery Address</p>
              <p style="margin:0;font-family:{SANS};font-size:13px;line-height:1.6;color:{INK};">{address_html}</p>
              {note_html}
            </td>
          </tr>

          <!-- Track -->
          <tr>
            <td align="center" style="padding:28px 28px 24px;">
              <a href="{track}" target="_blank" style="display:inline-block;padding:12px 28px;background:{EMERALD};border-radius:10px;font-family:{SANS};font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Track Your Order &rarr;</a>
              <p style="margin:18px 0 6px;font-family:{SANS};font-size:12px;font-weight:700;color:{INK};">Need help with your order?</p>
              <p style="margin:0;font-family:{SANS};font-size:12px;line-height:1.9;color:{MUTED};">{help_html}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:18px 28px;background:{EMERALD_SOFT};font-family:{SANS};font-size:11px;line-height:1.6;color:{MUTED};">
              You're receiving this because you placed an order on <a href="{home}" target="_blank" style="color:{EMERALD};">our website</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return text, html
