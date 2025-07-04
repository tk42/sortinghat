import { Container as Footer } from '@/src/components/Common/Footer';
import { Container as Logo } from "@/src/components/Common/Logo";
import { ArrowsRightLeftIcon, UserGroupIcon, AcademicCapIcon, CogIcon } from '@heroicons/react/24/outline'
import { LoginButton } from '@/src/components/Common/LoginButton';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';

const features = [
  {
    name: '席替えを簡単に',
    description:
      '複雑な席替えの計画を短時間で完了し、負担を軽減します',
    icon: ArrowsRightLeftIcon,
  },
  {
    name: '教員の主観を排除',
    description:
      '児童生徒の特性に基づいてスコアを算出し、客観的な席替えを実現します',
    icon: AcademicCapIcon,
  },
  {
    name: 'アクティブラーニング',
    description:
      '班分けや人間関係を児童自身が考えることで、アクティブラーニングを促進します',
    icon: UserGroupIcon,
  },
  {
    name: '柔軟な条件設定',
    description:
      '制約条件を柔軟に調整し、使いやすさを追求しました',
    icon: CogIcon,
  },
]

export type ContainerProps = {
  initialAuthState?: boolean;
}
type Props = {
  initialAuthState?: boolean;
} & ContainerProps

const HowToUse = () => {
  const NumberCircle = ({ number }: { number: number }) => (
    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-semibold shrink-0">
      {number}
    </span>
  );

  return (
    <div className="mt-10 max-w-[1920px] mx-auto px-4 sm:px-8">
      <div className="text-left">
        <div className="flex flex-col md:flex-row justify-between items-stretch gap-6">
          {/* 従来のプロセス */}
          <div className="flex-1 p-4 sm:p-8 bg-gray-50 rounded-lg w-full">
            <h3 className="text-2xl font-semibold mb-8">従来の方法</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <NumberCircle number={1} />
                <p className="text-lg">教員が児童生徒の特性を考える</p>
              </div>
              <div className="flex items-center gap-4">
                <NumberCircle number={2} />
                <p className="text-lg">班分けを考える</p>
              </div>
              <div className="flex items-center gap-4">
                <NumberCircle number={3} />
                <p className="text-lg">座席を考える</p>
              </div>
              <div className="flex items-center gap-4">
                <NumberCircle number={4} />
                <p className="text-lg">バランスが良くなるまで<span className="text-red-600 font-bold">1-3を繰り返す</span></p>
              </div>
              <img
                className="w-24 sm:w-40 mx-auto mt-6"
                src="/stressed-teacher.png"
                alt="ストレスを感じる先生"
              />
            </div>
          </div>

          {/* 矢印 */}
          <div className="hidden md:flex items-center justify-center self-center">
            <ArrowRightIcon className="w-16 h-16 text-blue-600" />
          </div>

          {/* 提案するプロセス */}
          <div className="flex-1 p-4 sm:p-8 bg-blue-50 rounded-lg w-full">
            <h3 className="text-2xl font-semibold mb-8">提案方式</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <NumberCircle number={1} />
                <div className="flex-1">
                  <p className="text-lg">児童生徒が心理テストに回答</p>
                </div>
                <img
                  className="w-20 h-20 sm:w-32 sm:h-32"
                  src="/student-test.png"
                  alt="テストを受ける児童生徒"
                />
              </div>
              <div className="flex items-start gap-4">
                <NumberCircle number={2} />
                <div className="flex-1">
                  <p className="text-lg">回答結果をシステムに入力</p>
                </div>
                <img
                  className="w-20 h-20 sm:w-32 sm:h-32"
                  src="/teacher-input.png"
                  alt="入力する先生"
                />
              </div>
              <div className="flex items-start gap-4">
                <NumberCircle number={3} />
                <div className="flex-1">
                  <p className="text-lg">最適な班分けが出力</p>
                </div>
                <img
                  className="w-20 h-20 sm:w-32 sm:h-32"
                  src="/system-output.png"
                  alt="システム出力"
                />
              </div>
              <div className="flex items-start gap-4">
                <NumberCircle number={4} />
                <div className="flex-1">
                  <p className="text-lg">班毎に座席配置</p>
                </div>
                <img
                  className="w-20 h-20 sm:w-32 sm:h-32"
                  src="/classroom-seats.png"
                  alt="教室の座席"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const MarkupHome = ({ initialAuthState }: { initialAuthState?: boolean }) => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-24">
      <Logo brand={true} />
      <div className='text-center mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <LoginButton initialAuthState={initialAuthState} />
      </div>

      <div className="bg-white py-12 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              児童生徒の心理特性に基づいて最適な班分けを数理最適化を用いて提案します
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              <a href="https://ja.wikipedia.org/wiki/%E5%A4%9A%E9%87%8D%E7%9F%A5%E8%83%BD%E7%90%86%E8%AB%96">多重知能理論(Multiple intelligences)</a>を実施した児童生徒たちのスコアに応じて，様々な制約下での最適な班分けを提案します
            </p>
          </div>

          <HowToUse />

          <div className="mx-auto mt-8 sm:mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-6 sm:gap-x-8 gap-y-6 sm:gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <section className="relative isolate overflow-hidden bg-white px-4 sm:px-6 py-12 sm:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <figure className="text-center mt-10">
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              利用者の声
            </p>
            <blockquote className="mt-6 text-lg sm:text-xl leading-8 text-gray-900 sm:text-2xl sm:leading-9">
              <p>
                “席替えを考えるのが楽しみになりました”
              </p>
            </blockquote>
            <figcaption className="mt-10">
              <img
                className="mx-auto h-20 w-16 rounded-full"
                src="/voice.png"
                alt=""
              />
              <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                <div className="font-semibold text-gray-900">奥埜 のぞみ</div>
                <svg viewBox="0 0 2 2" width={3} height={3} aria-hidden="true" className="fill-gray-900">
                  <circle cx={1} cy={1} r={1} />
                </svg>
                <div className="text-gray-600">小学校教員（京都市）</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      <Footer />
    </main>
  )
}


export default async function Home() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('auth-token')?.value;
  const initialAuthState = !!sessionCookie;
  
  return <MarkupHome initialAuthState={initialAuthState} />
}
