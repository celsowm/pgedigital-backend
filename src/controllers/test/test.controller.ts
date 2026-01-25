import {
  Controller,
  Get,
  Post,
  Body,
  Params,
  Returns,
  type RequestContext
} from "adorn-api";
import { TestDto, CreateTestDto, TestsListDto, TestParamsDto } from "../../dtos/test/test.dtos";

@Controller("/tests")
export class TestController {
  @Get("/")
  @Returns(TestsListDto)
  async getAll(ctx: RequestContext) {
    return {
      tests: [
        { id: "550e8400-e29b-41d4-a716-446655440000", name: "Test 1", description: "First test" },
        { id: "550e8400-e29b-41d4-a716-446655440001", name: "Test 2", description: undefined }
      ]
    };
  }

  @Get("/:id")
  @Params(TestParamsDto)
  @Returns(TestDto)
  async getOne(ctx: RequestContext<unknown, undefined, { id: string }>) {
    return {
      id: ctx.params.id,
      name: "Sample Test",
      description: "A sample test record"
    };
  }

  @Post("/")
  @Body(CreateTestDto)
  @Returns({ status: 201, schema: TestDto, description: "Created" })
  async create(ctx: RequestContext<CreateTestDto>) {
    return {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: ctx.body.name,
      description: ctx.body.description
    };
  }
}
