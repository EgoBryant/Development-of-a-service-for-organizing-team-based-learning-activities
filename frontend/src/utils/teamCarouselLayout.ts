export function shouldTeamCarouselScroll(memberCount: number): boolean {
    return memberCount > 4;
}

export function getTeamCarouselWrapClasses(memberCount: number): string {
    const classes = ["team-carousel-wrap"];

    if (memberCount > 4) {
        classes.push("team-carousel-wrap--scrollable");
    } else if (memberCount >= 1 && memberCount <= 4) {
        classes.push(`team-carousel-wrap--count-${memberCount}`);
    }

    return classes.join(" ");
}

export function getTeamCarouselClasses(memberCount: number): string {
    const classes = ["team-carousel"];

    if (memberCount > 4) {
        classes.push("team-carousel--scroll");
    }

    return classes.join(" ");
}
