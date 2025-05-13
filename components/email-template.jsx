export const EmailTemplate = (data) => (
  <div>
    <h1>New Contact, {data.name}!</h1>
    <p>{data.name} contacted.</p>
    <p>Email: {data.email}</p>
    <p>Phone: {data.phone}</p>
    <h2>Message:</h2>
    <p>{data.message}</p>
  </div>
);