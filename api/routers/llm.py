from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict, Any
import json
from openai import OpenAI
import os
import logging
from pydantic import BaseModel

logger = logging.getLogger("uvicorn.app")


class StudentPreference(BaseModel):
    student_id: int
    previous_team: int
    mi_a: int
    mi_b: int
    mi_c: int
    mi_d: int
    mi_e: int
    mi_f: int
    mi_g: int
    mi_h: int
    leader: int
    eyesight: int
    student_dislikes: list[int]


class StudentPreferences(BaseModel):
    preferences: list[StudentPreference]


router = APIRouter(
    prefix="/llm",
    tags=["llm"],
    include_in_schema=True
)

# OpenAIクライアントを初期化
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@router.post("/upload_file")
async def upload_file(
    file: UploadFile = File(...),
) -> StudentPreferences:
    # CSVファイルの内容を読み込む
    contents = await file.read()
    csv_text = contents.decode()

    # OpenAIのStructured Outputのプロンプトを作成
    system_prompt = """
    You are a data transformation expert. Your task is to transform the given CSV data into a provided response format.

    Important rules for transformation:
    1. For the 'leader' field:
       - "リーダーをがんばってみようかな" → 8
       - "サブリーダーをがんばってみようかな" → 3
       - "リーダーサブリーダーはお任せしようかな" → 1
       - Any other value → 1 (default)
    
    2. For the 'eyesight' field:
       - "はい！！目のかんけいで…" → 8
       - "あの、目のかんけいではないけど、できれば前がいいな…" → 3
       - "いいえ、どこでもいいよ" → 1
    
    The output must strictly follow the StudentPreferences model structure.
    """
    user_prompt = f"""
    Here is the sample data from the CSV:
    {csv_text}
    """
    
    # OpenAIのAPIを呼び出し
    completion = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format=StudentPreferences,
    )
    
    # レスポンスを解析してJSONに変換
    try:
        content = completion.choices[0].message.parsed
        logger.info(f"Response content: {json.dumps(content.dict(), ensure_ascii=False, indent=2)}")
        return content
    except Exception as e:
        return {
            "error": f"An error occurred: {str(e)}",
            "completion": completion
        }

@router.post("/format_constraints")
async def format_constraints(
    data: str = Form(...),
) -> Dict[str, Any]:
    # 自然言語で入力された制約条件を Constraints に変換する
    return json.loads(data)
