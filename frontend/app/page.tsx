import { Container as Footer } from '@/src/components/Common/Footer';
import { Container as Logo } from "@/src/components/Common/Logo";
import { ArrowsRightLeftIcon, UserGroupIcon, AcademicCapIcon, CogIcon } from '@heroicons/react/24/outline'
import { LoginComponent } from '@/src/components/Common/LoginComponent';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: '席替えを簡単に',
    description:
      '多大な負荷となる席替えを考える時間を短くすることができます',
    icon: ArrowsRightLeftIcon,
  },
  {
    name: '教員の主観を排除',
    description:
      '児童の心理特性に基づいてスコアを算出するため，教員の主観を排除できます',
    icon: AcademicCapIcon,
  },
  {
    name: 'アクティブラーニング',
    description:
      '班分け，人間関係について児童本人に考えさせることでアクティブラーニングを推進します',
    icon: UserGroupIcon,
  },
  {
    name: '条件を柔軟に設定できます',
    description:
      'AI搭載で，制約条件を柔軟に設定することができ，使いやすさにもこだわりました',
    icon: CogIcon,
  },
]

export type ContainerProps = {
}
type Props = {
} & ContainerProps

const HowToUse = () => {
  const NumberCircle = ({ number }: { number: number }) => (
    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-semibold shrink-0">
      {number}
    </span>
  );

  return (
    <div className="mt-10 max-w-[1920px] mx-auto px-8">
      <div className="text-center">
        <div className="flex flex-col md:flex-row justify-between items-stretch gap-6">
          {/* 従来のプロセス */}
          <div className="flex-1 p-8 bg-gray-50 rounded-lg min-w-[400px] lg:min-w-[500px]">
            <h3 className="text-2xl font-semibold mb-8">従来の方法</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <NumberCircle number={1} />
                <p className="text-lg">教員が児童の特性を考える</p>
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
                className="w-40 mx-auto mt-6"
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
          <div className="flex-1 p-8 bg-blue-50 rounded-lg min-w-[400px] lg:min-w-[500px]">
            <h3 className="text-2xl font-semibold mb-8">提案方式</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <NumberCircle number={1} />
                <div className="flex-1">
                  <p className="text-lg">児童が心理テストに回答</p>
                </div>
                <img
                  className="w-32 h-32"
                  src="/student-test.png"
                  alt="テストを受ける生徒"
                />
              </div>
              <div className="flex items-center gap-4">
                <NumberCircle number={2} />
                <div className="flex-1">
                  <p className="text-lg">回答結果をシステムに入力</p>
                </div>
                <img
                  className="w-32 h-32"
                  src="/teacher-input.png"
                  alt="入力する先生"
                />
              </div>
              <div className="flex items-center gap-4">
                <NumberCircle number={3} />
                <div className="flex-1">
                  <p className="text-lg">最適な班分けが出力</p>
                </div>
                <img
                  className="w-32 h-32"
                  src="/system-output.png"
                  alt="システム出力"
                />
              </div>
              <div className="flex items-center gap-4">
                <NumberCircle number={4} />
                <div className="flex-1">
                  <p className="text-lg">班毎に座席配置</p>
                </div>
                <img
                  className="w-32 h-32"
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

const MarkupHome = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Logo brand={true} />
      <div className='text-center mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <LoginComponent />
      </div>

      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              児童の心理特性に基づいて最適な班分けを数理最適化を用いて提案します
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              <a href="https://ja.wikipedia.org/wiki/%E5%A4%9A%E9%87%8D%E7%9F%A5%E8%83%BD%E7%90%86%E8%AB%96">多重知能理論(Multiple intelligences)</a>を実施した児童たちのスコアに応じて，様々な制約下での最適な班分けを提案します
            </p>
          </div>

          <HowToUse />

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
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

      <section className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <figure className="text-center mt-10">
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              利用者の声
            </p>
            <blockquote className="mt-6 text-xl leading-8 text-gray-900 sm:text-2xl sm:leading-9">
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
  return <MarkupHome />
}
