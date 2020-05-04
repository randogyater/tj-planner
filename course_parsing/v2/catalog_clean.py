import re
  

if __name__ == "__main__":
    result = list()
    id = re.compile(r'\d[\dA-Z]{5}$')
    with open("course_parsing/v2/catalog.txt", 'r') as file:
        for line in file.readlines():
            words = re.split(r'\s+', line)
            new_words = list()
            for word in words:
                if id.search(word):
                    if len(word)>6:
                        new_words.append(word[:-6].upper())
                    new_words.append("|")
                    new_words.append(word[-6:])
                    new_words.append("|")
                else:
                    new_words.append(word.upper())
            result.append(" ".join(new_words))
    with open("course_parsing/v2/catalog.txt", "w") as file:
        file.write("\n".join(result))