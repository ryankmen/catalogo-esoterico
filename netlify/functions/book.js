
/* book.js - placeholder for booking function
   Should verify availability, create calendar event, save to DB and send email in production.
*/
exports.handler = async function(event, context) {
  try {
    const body = JSON.parse(event.body || '{}');
    console.log('Booking request', body);
    // Basic demo response: accept and respond success=true
    return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Reserva (demo) registrada' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: err.message }) };
  }
};
