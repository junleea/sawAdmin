
export interface WSMessage {
    type: string;
    msg: AIQMessage;
    session_id: number;
    to_id: number;
}

export interface AIQMessage {
    type: string;
    id: number;
    msg: OllamaMessage;
}

export interface OllamaMessage {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    done_reason: string;
    //int数组
    context:  number[];
}

export interface OllamaRequest {
    model: string;
    request: string;
    system: string;
    prompt: string;
    context: number[];
}

