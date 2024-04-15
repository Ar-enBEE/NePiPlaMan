export type Stream = {
	uid: string;
	service_id: number;
	url: string;
	title: string;
	stream_type: string;
	duration: number;
	uploader: string;
	uploader_url: string;
	thumbnail_url: string;
	view_count: number;
	textual_upload_date: string;
	upload_date: number;
	is_upload_date_approximation: number;
	progress_time: number | null;
	tag?: Tag;
};

export type Tag = {
	uid: string;
	name: string;
	color: string;
};

export type Playlist = {
	uid: string;
	name: string;
	is_thumbnail_permanent: string;
	thumbnail_stream_id: string;
};

export type StreamState = {
	stream_id: number;
	progress_time: number;
};
