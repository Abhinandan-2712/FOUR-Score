import { IoIosTrendingDown, IoIosTrendingUp } from "react-icons/io";
import { FaUser } from "react-icons/fa";

export default function Card({
  title = "Total Guardians",
  amount = 0,
  percentage = 0,
  isIncrease = true,
  para = "Parents Who Have Visited So Far",
  isCurrency = false,
  icon: Icon = FaUser,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
}) {
  return (
    <div className="w-full max-w-sm rounded-lg border border-[#C8D7E9] bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-normal text-[#2158A3]">{title}</p>
            <h1 className="mt-1 text-xl font-semibold leading-7 tracking-normal text-[#0A3161]">
              {isCurrency
                ? `$${Number(amount).toLocaleString()}`
                : Number(amount).toLocaleString()}
            </h1>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBg}`}
          >
            <Icon className={`text-2xl ${iconColor}`} />
          </div>


        </div>

        <div className="my-2 h-px w-full bg-gray-100" />
        <div className="flex items-center gap-4 ">
          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm
              ${isIncrease ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
            `}
          >
            {isIncrease ? <IoIosTrendingUp /> : <IoIosTrendingDown />}
            {percentage}%
          </div>
          <p className="text-sm font-medium text-gray-500">{para}</p>

        </div>

      </div>
    </div>
  );
}
