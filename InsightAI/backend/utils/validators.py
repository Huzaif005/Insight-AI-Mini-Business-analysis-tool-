def is_allowed_file(filename: str, allowed_exts=None) -> bool:
    if allowed_exts is None:
        allowed_exts = ['csv', 'xlsx', 'json']
    return filename.split('.')[-1].lower() in allowed_exts
