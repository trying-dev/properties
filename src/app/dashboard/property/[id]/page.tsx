export default function PropertyPage({ params: { id } }: { params: { id: string } }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">Property {id}</h1>
      <p className="text-lg mb-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, voluptatibus?
      </p>
      <ul className="list-disc pl-8">
        <li>Id: 1</li>
        <li>Name: My Property</li>
        <li>Address: My Address</li>
        <li>City: My City</li>
        <li>State: My State</li>
        <li>Zip: 12345</li>
      </ul>
    </div>
  );
}
