#!/bin/bash
cd web && npm run dev &
cd app && npm run dev &
wait