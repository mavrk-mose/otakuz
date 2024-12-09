"use client"

interface StreamCardProps {
    title: string; // Title of the card
    author: string; // Name of the author
    time?: string; // Time information (optional)
    comments: number; // Number of comments
    tag: string; // Category or tag for the card
    image?: string; // URL of the image (optional)
}

const StreamCard = ({ title, author, time, comments, tag, image } : StreamCardProps) => {
    return (
        <div className="flex items-start gap-4 p-4 border-b border-gray-700 hover:bg-gray-800 transition duration-200">
            {/* Left Section: Tag and Info */}
            <div className="flex flex-col justify-between">
                <span className="text-sm text-teal-500 uppercase">{tag}</span>
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="text-xs text-gray-400">
                        {author} {time && `- ${time}`} | {comments} comments
                    </p>
                </div>
            </div>

            {/* Right Section: Image */}
            {image && (
                <div className="w-20 h-16">
                    <img
                        src={image}
                        alt="Article thumbnail"
                        className="w-full h-full object-cover rounded"
                    />
                </div>
            )}
        </div>
    );
};

const TodaysStream = () => {
    const streamItems = [
        {
            title: "Michelle Yeoh’s spy team assembles in Star Trek: Section 31’s official trailer",
            author: "Wes Davis",
            time: "12:16 AM GMT+3",
            comments: 10,
            tag: "Star Trek",
            image: "https://via.placeholder.com/80x64", // Replace with actual image URL
        },
        {
            title: "AGI is coming and nobody cares",
            author: "David Pierce",
            time: "Dec 6",
            comments: 28,
            tag: "Vergecast",
            image: "https://via.placeholder.com/80x64", // Replace with actual image URL
        },
        {
            title: "X gives Grok a new photorealistic AI image generator",
            author: "Wes Davis",
            time: "Dec 7",
            comments: 5,
            tag: "Social Media",
            image: "https://via.placeholder.com/80x64", // Replace with actual image URL
        },
        {
            title:
                "X helps update Kids Online Safety Act in final push for passage in the Republican-led House",
            author: "Lauren Feiner",
            time: "Dec 7",
            comments: 1,
            tag: "Tech",
            image: "https://via.placeholder.com/80x64", // Replace with actual image URL
        },
    ];

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-bold text-green-500">Today's Stream</h2>
            <div>
                {streamItems.map((item, index) => (
                    <StreamCard key={index} {...item} />
                ))}
            </div>
        </div>
    );
};

export default TodaysStream;
