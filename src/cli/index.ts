#!/usr/bin/env node

import createProgram from './createProgram';

const program = createProgram();

program.parse(process.argv);
