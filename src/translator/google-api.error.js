class GoogleApiError extends Error {
  constructor(response) {
    super(
      response?.data?.error?.message ||
        'Unexpected Google Translation API Error'
    );
    this.details = response.data.error;
  }
}

module.exports = {
  GoogleApiError,
};
