#!/bin/bash

for day in {9..22}
do
	node tools/enrich_routes.js "2015-2-$day"
done
