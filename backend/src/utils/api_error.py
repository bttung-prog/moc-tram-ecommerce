class ApiError(Exception):
    def __init__(self, status_code: int, message: str, error: (list | None) = None):
        super().__init__(message)

        self.name = "ApiError"
        self.status_code = status_code
        self.error = error if error is not None else []
