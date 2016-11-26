
# Translations Sheet CLI

With the [Google Translate API][translate_docs], you can dynamically translate
text between thousands of language pairs.

[translate_docs]: https://cloud.google.com/translate/docs/

## Table of Contents

* [Setup](#setup)
* [Examples](#examples)
* [Flags](#flags)
* [TODO List](#todo-list)
* [About](#about)

## Setup

1. Download client-secrets from Google Cloud Console (GCC)
1. Generate Google Translate API key on GCC and paste it into config.json
1. Edit Config file with Translations Sheet Id in config.json
1. Update the array of languages to be translated into in config.json
1. Install dependencies:

        npm install

## Examples

        node index.js --in "Hello World"

## Flags
      
        --in    Input phrase or word
        --key   Translated string key (Optional)

## TODO List

[] Check if a phrase already exists on Translations Sheet

## About
Author: Ziyad Al-Obaidi
License: ISC
