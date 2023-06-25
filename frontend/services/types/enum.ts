export type SexUnion = 0 | 1
export function Sex(sex: SexUnion) {
    switch (sex) {
        case 0:
            return '男'
        case 1:
            return '女'
    }
}

export type LeaderUnion = 1 | 3 | 8
export function Leader(leader: LeaderUnion) {
    switch (leader) {
        case 1:
            return 'メンバー'
        case 3:
            return 'サブリーダー'
        case 8:
            return 'リーダー'
    }
}

export type EyeSightUnion = 1 | 3 | 8
export function EyeSight(eyeSight: EyeSightUnion) {
    switch (eyeSight) {
        case 1:
            return 'どこでも'
        case 3:
            return '前方希望'
        case 8:
            return '前方必須'
    }
}
