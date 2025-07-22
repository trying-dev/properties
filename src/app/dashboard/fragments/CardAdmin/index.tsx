import Image from "next/image";

export default function CardAdmin() {
  return (
    <div className="flex gap-5 p-[10px] border rounded-md w-[401px] h-[100px]">
      <Image
        src="/images/img2.png"
        alt="Picture of the author"
        width={80}
        height={80}
        className="rounded-md"
      />
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Administrador</p>
        <div className="flex gap-5">
          <Image
            src="/icons/plus.svg"
            alt="plus"
            width={30}
            height={30}
            className="bg-[#D9D9D9] p-1 rounded-full fill-white"
          />
        </div>
      </div>
    </div>
  );
}
