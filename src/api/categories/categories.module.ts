import { Module } from "@nestjs/common";

import { CategoriesController } from "./categories.controller";
import { CategoriesRepository } from "./categories.repository";
import { CategoriesService } from "./categories.service";

@Module({
  imports: [],
  controllers: [CategoriesController],
  providers: [CategoriesRepository, CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
