I've archived the scripts used to get the course data ([courses_by_id.json](../courses_by_id.json) and [labs_by_id.json](../labs_by_id.json))

The process went something like:

- Raw HTML ([course_catalog_html.txt](course_catalog_html.txt)) obtained from Matthew Cox, Sarah Gold, and Youn Qi's [Scheduler](https://github.com/matthewjcox/scheduler/) project, with permission
- [catalog_parser.py](catalog_parser.py) to clean the html of tags (stored into intermediate file [course_catalog_html_cleaned.txt](course_catalog_html_cleaned.txt)) then parse into [courses.json](courses.json). Most of this script is also taken from Cox, Gold and Qi but I've modified it to output JSON instead of text.
- [courses_cleaner.py](courses_cleaner.py) removes administrative courses and splits out the senior research labs into [labs.json](labs.json). Remaining courses go to [courses_cleaned.json](courses_cleaned.json)
- [json_normalizer.py](json_normalizer.py) changes it into a dict with the course IDs as the keys and records courses that have each course as a prerequisite as `dependents`. It does the same for the labs and yields ([courses_by_id.json](../courses_by_id.json) and [labs_by_id.json](../labs_by_id.json))
- The final two files are adjusted manually
