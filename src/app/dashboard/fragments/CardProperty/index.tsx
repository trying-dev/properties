import Image from "next/image";
import { Property } from "@prisma/client";
import { useDispatch } from "react-redux";

import { useRouter } from "next/navigation";

import { serialize } from " +/redux/utils";

import { getPropertyForReduxWhenComponentLoad } from " +/actions/property/actions_and_mutations";
import { setProperty } from " +/redux/slices/property";

export default function CardProperty({ property }: { property: Property }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { name = "Name", street = "Street", number = "000", neighborhood = "neighborhood" } = property;

  const clickHandler = async () => {
    const propertyForReduxWhenComponentLoad = await getPropertyForReduxWhenComponentLoad({
      id: property.id,
    });
    console.log({ propertyForReduxWhenComponentLoad });
    dispatch(setProperty(serialize(propertyForReduxWhenComponentLoad)));
    router.push(`/dashboard/property/${property.id}`);
  };

  return (
    <button
      className="flex gap-5 p-[10px] border rounded-md w-[400px] cursor-pointer items-center"
      onClick={clickHandler}
    >
      <>
        <Image
          src="/images/img1.png"
          alt="Picture of the property"
          width={80}
          height={80}
          className="rounded-md w-20 h-20"
        />
        <div className="flex flex-col gap-1 items-start">
          <p className="font-semibold">{name}</p>
          <p className="font-semibold">
            {street} {number}, {neighborhood}
          </p>
        </div>
      </>
    </button>
  );
}
