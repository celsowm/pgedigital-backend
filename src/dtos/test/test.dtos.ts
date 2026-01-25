import { Dto, Field, OmitDto, PickDto, t } from "adorn-api";

@Dto({ description: "Test record returned by the API." })
export class TestDto {
  @Field(t.uuid({ description: "Test identifier." }))
  id!: string;

  @Field(t.string({ minLength: 1 }))
  name!: string;

  @Field(t.optional(t.string()))
  description?: string;
}

export interface CreateTestDto extends Omit<TestDto, "id"> {}

@OmitDto(TestDto, ["id"])
export class CreateTestDto {}

export interface TestParamsDto extends Pick<TestDto, "id"> {}

@PickDto(TestDto, ["id"])
export class TestParamsDto {}

@Dto({ description: "Response payload containing the list of tests." })
export class TestsListDto {
  @Field(t.array(t.ref(TestDto)))
  tests!: TestDto[];
}
