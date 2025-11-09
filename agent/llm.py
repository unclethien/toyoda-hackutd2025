from openai import OpenAI
from dotenv import load_dotenv
import os
from pydantic import BaseModel
import weave

class Answer(BaseModel):
  answer: str

class LLM:
    def __init__(self, project_name: str = "hackutd2025"):
        load_dotenv()
        # Initialize Weave project for observability
        weave.init(project_name)
        self.client = OpenAI(
            base_url = "https://integrate.api.nvidia.com/v1",
            api_key = os.getenv("NVIDIA_API_KEY")
        )
    
    @weave.op()
    def __call__(self, system_prompt: str, user_prompt: str, output_type: BaseModel) -> BaseModel:
        completion = self.client.chat.completions.create(
            model="nvidia/nvidia-nemotron-nano-9b-v2",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.6,
            top_p=0.95,
            max_tokens=2048,
            frequency_penalty=0,
            presence_penalty=0,
            extra_body={
                "min_thinking_tokens": 1024,
                "max_thinking_tokens": 2048
            },
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": output_type.__name__,
                    "schema": output_type.model_json_schema()
                },
            },
        )

        # reasoning = getattr(completion.choices[0].message, "reasoning_content", None)
        content = completion.choices[0].message.content
        return output_type.model_validate_json(content)

if __name__ == "__main__":
    llm = LLM()
    answer = llm("What is the capital of France?", Answer)
    print(answer)