export default function CardPayment({ info }: { info: any }) {
  return (
    <div className="flex gap-5 p-5 border">
      <p> {info.paymentStatus} </p>
      <p> {new Date(info.paymentDate).toLocaleDateString()} </p>
    </div>
  );
}
