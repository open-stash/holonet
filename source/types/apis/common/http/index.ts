export type BaseResponse = {
    success: boolean;
    http_code: number;
    error_code: string | null;
    notification: BaseResponseNotification | null;
};

type BaseResponseNotification = {
    type: "info" | "warning" | "error" | "success";
    message: string;
};

export type PaginationOffsetMetaData = {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    next_page: number;
    previous_page: number;
}