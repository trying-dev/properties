import Image from "next/image";
import { Property } from "@prisma/client";
import { useDispatch } from "react-redux";

import { useRouter } from "next/navigation";

import { serialize } from " +/redux/utils";

import { getPropertyForReduxWhenComponentLoad } from " +/actions/property/actions_and_mutations";
import { setProperty } from " +/redux/slices/property";

const labels = [
  { src: "/icons/plus.svg", alt: "plus" },
  { src: "/icons/user.svg", alt: "user" },
  { src: "/icons/user.svg", alt: "dollar" },
];

export default function CardProperty({ property }: { property: Property }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { streetAndNumber = "streetAndNumber", neighborhood = "neighborhood" } = property;
  const address = `${streetAndNumber}, ${neighborhood}`;

  const clickHandler = async () => {
    const propertyForReduxWhenComponentLoad = await getPropertyForReduxWhenComponentLoad({
      id: property.id,
    });
    dispatch(setProperty(serialize(propertyForReduxWhenComponentLoad)));
    router.push(`/dashboard/property/${property.id}/info`);
  };

  return (
    <button className="flex gap-5 p-[10px] border rounded-md w-[401px] h-[100px]" onClick={clickHandler}>
      <>
        <Image
          src="/images/img1.png"
          alt="Picture of the property"
          width={80}
          height={80}
          className="rounded-md"
        />
        <div className="flex flex-col gap-3">
          <p className="font-semibold">{address}</p>
          <div className="flex gap-5">
            {labels.map((label, index) => (
              <Image
                key={`${index}-${label.alt}`}
                src={label.src}
                alt={label.alt}
                width={30}
                height={30}
                className="bg-[#D9D9D9] p-1 rounded-full w-[30px] h-[30px]"
              />
            ))}
          </div>
        </div>
      </>
    </button>
  );
}
