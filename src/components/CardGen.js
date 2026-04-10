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
    <div className="surface-card w-full transition-shadow duration-300 hover:shadow-[var(--shadow-premium)]">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-primary/75">{title}</p>
            <h1 className="mt-1 text-xl font-semibold leading-7 tracking-tight text-primary">
              {isCurrency
                ? `$${Number(amount).toLocaleString()}`
                : Number(amount).toLocaleString()}
            </h1>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-border/60 ${iconBg}`}
          >
            <Icon className={`text-2xl ${iconColor}`} />
          </div>
        </div>

        <div className="my-3 h-px w-full bg-border/70" />
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm
              ${isIncrease ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
            `}
          >
            {isIncrease ? <IoIosTrendingUp /> : <IoIosTrendingDown />}
            {percentage}%
          </div>
          <p className="text-sm font-medium text-muted-foreground">{para}</p>
        </div>
      </div>
    </div>
  );
}
