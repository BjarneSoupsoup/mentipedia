interface YoutubeVideoComponentParams {
    hash_id:    string;
    start:      number;
    end:        number;
}

export function YoutubeVideo(params: YoutubeVideoComponentParams) {
    const { hash_id, start, end } = params
    return <iframe className="object-fill h-full w-full" src={`https://www.youtube.com/embed/${hash_id}?start=${start}&amp;end=${end}`} 
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen={true} />
}