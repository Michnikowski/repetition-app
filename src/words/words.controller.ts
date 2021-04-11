import { Controller, Get, Post, Body, Patch, Param, Delete, Render } from '@nestjs/common';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get('/membean')
  getMembeanWords(){
    return this.wordsService.getMembeanWords();
  }

  @Get('/:letter/:pageNumber')
  @Render('wordsByLetter')
  async getMemberWordsByLetter(
    @Param('letter') letter: string,
    @Param('pageNumber') pageNumber: number,
  ) {
    return await this.wordsService.getMemberWordsByLetter(letter, Number(pageNumber));
  }

  // @Post()
  // create(@Body() createWordDto: CreateWordDto) {
  //   return this.wordsService.create(createWordDto);
  // }

  // @Get()
  // findAll() {
  //   return this.wordsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.wordsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateWordDto: UpdateWordDto) {
  //   return this.wordsService.update(+id, updateWordDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.wordsService.remove(+id);
  // }
}
