I've archived the scripts used to get the course data ([courses.json](../courses.json) and [labs.json](../labs.json))

The process went something like:

- Raw HTML ([course_catalog_html.txt](course_catalog_html.txt)) obtained from Matthew Cox, Sarah Gold, and Youn Qi's [Scheduler](https://github.com/matthewjcox/scheduler/) project, with permission
- [catalog_parser.py](catalog_parser.py) to clean the html of tags (stored into intermediate file [course_catalog_html_cleaned.txt](course_catalog_html_cleaned.txt)) then parse into [courses_raw.json](courses_raw.json). Most of this script is also taken from Cox, Gold and Qi but I've modified it to output JSON instead of text.
- [courses_cleaner.py](courses_cleaner.py) removes administrative courses and splits out the senior research labs into [labs_raw.json](labs_raw.json). Remaining courses go to [courses_cleaned.json](courses_cleaned.json)
- [json_normalizer.py](json_normalizer.py) changes it into a dict with the course IDs as the keys and records courses that have each course as a prerequisite as `dependents`. It does the same for the labs and yields ([courses_by_id.json](courses_by_id.json) and [labs_by_id.json](labs_by_id.json)). Any duplicate names are stored in [conflicts.txt](conflicts.txt)
- Conflicts are sorted out (normalizer handles online and summer, so mainly teaming stuff)
- Copied to [courses.json](../courses.json) and [labs.json](../labs.json) in the upper folder (these are the only two that are final)
- The final two files are adjusted manually (in particular, online classes are deleted)
