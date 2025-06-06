import os
import json
import logging
from openai import OpenAI
from typing import Dict, Any
from fastapi import APIRouter, UploadFile, File, Form

from models.match import Students, StudentPreferences


logger = logging.getLogger("uvicorn.app")


router = APIRouter(
    prefix="/llm",
    tags=["llm"],
    include_in_schema=True
)

# OpenAIクライアントを初期化
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@router.post("/format_class")
async def format_class(
    file: UploadFile = File(...),
) -> Students:
    # CSVファイルの内容を読み込む
    contents = await file.read()
    try:
        csv_text = contents.decode('utf-8')
    except UnicodeDecodeError:
        csv_text = contents.decode('cp932')

    # OpenAIのStructured Outputのプロンプトを作成
    system_prompt = """
    You are a data transformation expert. Your task is to transform the given CSV data into a provided response format.

    Important rules for transformation:
    1. For the 'sex' field:
       - "男" → 1
       - "女" → 2

    2. For the 'memo' field:
       - "" → None
    
    3. For the 'student_no' field: Fill the row number as the value if the column doesn't exist.
    
    The output must strictly follow Students model structure.
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
        response_format=Students,
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


@router.post("/format_survey")
async def format_survey(
    file: UploadFile = File(...),
) -> StudentPreferences:
    # CSVファイルの内容を読み込む
    contents = await file.read()
    try:
        csv_text = contents.decode('utf-8')
    except UnicodeDecodeError:
        csv_text = contents.decode('cp932')

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
    
    The output must strictly follow StudentPreferences model structure.
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
