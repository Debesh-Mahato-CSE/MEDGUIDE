import { IconType } from 'react-icons'
import { motion } from 'framer-motion'

interface StatsCardProps {
  title: string
  value: string | number
  icon: IconType
  color: string
  trend?: {
    value: string
    isPositive: boolean
  }
}

const StatsCard = ({ title, value, icon: Icon, color, trend }: StatsCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card card-hover"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </motion.div>
  )
}

export default StatsCard