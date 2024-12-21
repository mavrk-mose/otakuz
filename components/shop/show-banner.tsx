import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface ShowBannerProps {
    title: string
    subtitle: string
    image: string
    color: string
}

export function ShowBanner({ title, subtitle, image, color }: ShowBannerProps) {
    return (
        <Link href={`/shop/${title.toLowerCase().replace(' ', '-')}`}>
            <motion.div
                className="relative h-[300px] rounded-lg overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <div className={`absolute inset-0 bg-gradient-to-r ${color} to-transparent z-10`} />
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                />
                <div className="absolute bottom-8 left-8 z-20">
                    <h3 className="text-3xl font-bold mb-2">{title}</h3>
                    <p className="text-lg text-gray-200">{subtitle}</p>
                </div>
            </motion.div>
        </Link>
    )
}

