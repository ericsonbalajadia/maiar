export default function CheckEmailPage() {
  return (
    <div className="text-center space-y-4 p-8">
      <h1 className="text-2xl font-bold">Check your email</h1>
      <p className="text-slate-600">
        We've sent a confirmation link to your email address.
        Please click the link to verify your account.
      </p>
      <p className="text-sm text-slate-400">
        You will then be able to log in after an admin approves your account.
      </p>
    </div>
  );
}