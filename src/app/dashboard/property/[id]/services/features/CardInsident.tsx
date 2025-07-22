export default function CardInsident({ info }: { info: any }) {
  return (
    <div className="flex gap-5 p-5 border">
      <p> {new Date(info.incidentDate).toLocaleDateString()} </p>
      <p> {info.incidentDescription} </p>
    </div>
  );
}
