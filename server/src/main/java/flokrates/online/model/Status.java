package flokrates.online.model;

public enum Status {
    PUBLISHED("PU", "Published"),
    REWORK("RE", "Rework"),
    DRAFT("DR", "Draft"),
    NOTES("NO", "Notes");

    private final String code;
    private final String displayName;

    Status(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Status fromCode(String code) {
        for (Status status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown code: " + code);
    }
}
