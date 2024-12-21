import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

// TODO: should be fetched
const categories = [
    {
        name: "Clothing",
        image: "https://thalasiknitfab.com/cdn/shop/files/luffyhoodie-1_WHITEBG_490x.progressive.jpg?v=1731753749",
        count: 124
    },
    {
        name: "Figures",
        image: "https://funko.com/dw/image/v2/BGTS_PRD/on/demandware.static/-/Sites-funko-master-catalog/default/dwd432fa53/images/funko/upload/80393_MHA_S13_KatsukiBakugo_POP_PLUS_GLAM-WEB.png?sw=800&sh=800",
        count: 89
    },
    {
        name: "Accessories",
        image: "https://cdn.trendhunterstatic.com/thumbs/483/dragon-ball-z-1.jpeg?auto=webp",
        count: 56
    },
    {
        name: "Home & Decor",
        image: "https://seekerenterprise.com/cdn/shop/products/Canvas-Pictures-Wall-Art-Prints-5-Pieces-Anime-Home-Decor-Canvas_1024x1024@2x.png?v=1657853719",
        count: 34
    }
]

export function CategoryList() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
                <Link key={category.name} href={`/shop/category/${category.name.toLowerCase()}`}>
                    <motion.div
                        className="relative h-[200px] rounded-lg overflow-hidden group cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10" />
                        <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                            <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                            <p className="text-sm text-gray-200">{category.count} Products</p>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
    )
}

