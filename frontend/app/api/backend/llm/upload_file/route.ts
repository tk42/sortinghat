import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        // リクエストからFormDataを取得
        const formData = await req.formData()
        
        // バックエンドAPIにリクエストを転送
        const backendUrl = `${process.env.BACKEND_API_URL}/llm/upload_file`
        const response = await fetch(backendUrl, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            // エラーレスポンスをそのまま転送
            return new NextResponse(await response.text(), {
                status: response.status,
                headers: {
                    'Content-Type': response.headers.get('Content-Type') || 'application/json',
                },
            })
        }

        console.info("backend/llm/upload_file", response)

        // 成功レスポンスを転送
        const data = await response.json()
        return NextResponse.json(data)

    } catch (error) {
        console.error('Error in upload_file API route:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}