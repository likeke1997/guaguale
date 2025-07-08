import { useEffect, useState } from 'react';
import './App.css';

const NUMS = new Array(9).fill(1).map((_, i) => i + 1);

const LUCKY_NUM = 7;

const LUCKY_MONEY = 10;

const EFFECT_LIST: { label: string; description: string; effects: (level: number) => Record<string, number> }[] = [
    {
        label: '增加数字',
        description: '刮数字数量+{R1}',
        effects: (level) => ({
            '{R1}': 1 * level,
        }),
    },
    {
        label: '锦鲤',
        description: '中奖率+{R1}%',
        effects: (level) => ({
            '{R1}': 10 * level,
        }),
    },
    {
        label: '赌神',
        description: '彩票价格+{R1}%，奖金+{R1}%',
        effects: (level) => ({
            '{R1}': 100 * level,
        }),
    },
    {
        label: '双喜',
        description: '刮出的每2个相同数字，奖金+{R1}%',
        effects: (level) => ({
            '{R1}': 20 * level,
        }),
    },
    {
        label: '三条',
        description: '刮出的每3个相同数字，奖金+{R1}%',
        effects: (level) => ({
            '{R1}': 45 * level,
        }),
    },
    {
        label: '四通',
        description: '刮出的每4个相同数字，奖金+{R1}%',
        effects: (level) => ({
            '{R1}': 80 * level,
        }),
    },
    {
        label: '五福',
        description: '刮出的每5个相同数字，奖金+{R1}%',
        effects: (level) => ({
            '{R1}': 125 * level,
        }),
    },
    // {
    //     label: '顺子',
    //     description: '刮出的每个顺子(如1,2,3)，奖金+{R1}%',
    //     effects: (level) => ({
    //         '{R1}': 20 * level,
    //     }),
    // },
    {
        label: '雨露均沾',
        description: '刮到任意数字都有奖金，奖金为数字大小x{R1}',
        effects: (level) => ({
            '{R1}': 1 * level,
        }),
    },
    // {
    //     label: '增加选项',
    //     description: '增加{R1}个增益选项',
    //     effects: (level) => ({
    //         '{R1}': 1 * level,
    //     }),
    // },
];

const MONEY_GOAL = 100000000;

function App() {
    const [effects, setEffects] = useState<Record<string, number>>({});

    const [money, setMoney] = useState(100);

    /**
     * 物价倍率
     */
    const priceRatio = 1 + getEffectValue('赌神') / 100;

    const ticketPrice = 10 * priceRatio;

    const luckyMoney = LUCKY_MONEY * priceRatio;

    const [nums, setNums] = useState<number[]>([]);

    const [luckyCount, setLuckyCount] = useState(0);

    const effectCount = 3 + getEffectValue('增加选项');

    const numCount = 7 + getEffectValue('增加数字');

    function getEffectValue(label: string) {
        return EFFECT_LIST.find((eff) => eff.label === label)?.effects(effects[label] ?? 0)['{R1}'] ?? 0;
    }

    const [award, setAward] = useState(0);

    const calcEffects = (newNums: number[]) => {
        let luckeyAward = newNums.filter((num) => num === LUCKY_NUM).length * luckyMoney;

        NUMS.forEach((num) => {
            const numCount = newNums.filter((newNum) => newNum === num).length;
            const effectAward = getEffectValue('雨露均沾') * num * numCount;

            luckeyAward += effectAward;
        });

        let ratio = 1;

        NUMS.forEach((num) => {
            const numCount = newNums.filter((newNum) => newNum === num).length;
            const effectCount = Math.floor(numCount / 2);
            ratio *= 1 + (effectCount * getEffectValue('双喜')) / 100;
        });

        NUMS.forEach((num) => {
            const numCount = newNums.filter((newNum) => newNum === num).length;
            const effectCount = Math.floor(numCount / 3);
            ratio *= 1 + (effectCount * getEffectValue('三条')) / 100;
        });

        NUMS.forEach((num) => {
            const numCount = newNums.filter((newNum) => newNum === num).length;
            const effectCount = Math.floor(numCount / 4);
            ratio *= 1 + (effectCount * getEffectValue('四通')) / 100;
        });

        NUMS.forEach((num) => {
            const numCount = newNums.filter((newNum) => newNum === num).length;
            const effectCount = Math.floor(numCount / 5);
            ratio *= 1 + (effectCount * getEffectValue('五福')) / 100;
        });

        setAward(luckeyAward * ratio);

        return luckeyAward * ratio;
    };

    const [randomEffects, setRandomEffects] = useState<string[]>(() =>
        new Array(effectCount)
            .fill(0)
            .map(getRandomEffect)
            .map((EFFECT) => EFFECT.label)
    );

    function getRandomNum() {
        if (Math.random() * 100 <= 10 + effects['锦鲤']) {
            return 7;
        }

        return Math.round(Math.random() * 9) + 1;
    }

    function getRandomEffect() {
        const index = Math.round(Math.random() * EFFECT_LIST.length);

        return EFFECT_LIST[index];
    }

    const [restTime, setRestTime] = useState(600);
    useEffect(() => {
        const timer = window.setInterval(() => {
            setRestTime((prev) => prev - 1);
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [restTime]);

    return (
        <>
            <fieldset>
                <legend>状态</legend>
                <div>时间，还剩{restTime}秒</div>
                <div>现金：{money}</div>
                <div>目标：{MONEY_GOAL}</div>
                <progress value={money} max={MONEY_GOAL}></progress>
            </fieldset>

            <fieldset>
                <legend>请选择/升级增益效果</legend>
                {EFFECT_LIST.map(({ label: effectLabel }) => {
                    const EFFECT = EFFECT_LIST.find((e) => e.label === effectLabel)!;

                    const level = effects[effectLabel] ?? 0;
                    const nextLevel = level + 1;

                    const value = String(EFFECT.effects(level)['{R1}']);
                    const nextValue = String(EFFECT.effects(nextLevel)['{R1}']);

                    return (
                        <div>
                            <button
                                disabled={luckyCount < 5}
                                onClick={() => {
                                    setEffects((prev) => {
                                        const currLevel = prev[effectLabel] ?? 0;

                                        return {
                                            ...prev,
                                            [effectLabel]: currLevel + 1,
                                        };
                                    });

                                    setLuckyCount((prev) => prev - 5);
                                }}>
                                <span>{`[等级${level}→${nextLevel}]`}</span>
                                <span>{EFFECT.label}</span>
                                <span>{EFFECT.description.replaceAll('{R1}', `(${value}→${nextValue})`)}</span>
                                <span></span>
                            </button>
                        </div>
                    );
                })}
                <div>刮出({luckyCount}/5)次幸运数字后可选择增益效果</div>
                <progress value={luckyCount} max={5}></progress>
            </fieldset>

            <fieldset>
                <legend>刮奖区</legend>
                <div>中奖率：{10 + (effects['锦鲤'] ?? 0)}%</div>
                <button
                    disabled={money < ticketPrice}
                    onClick={() => {
                        const newNums = new Array(numCount).fill(undefined).map(getRandomNum);

                        setMoney((prev) => prev - ticketPrice);
                        setNums(() => newNums);

                        const effectedMoney = calcEffects(newNums);

                        setLuckyCount((prev) => prev + newNums.filter((num) => num === LUCKY_NUM).length);
                        setMoney((prev) => prev + effectedMoney);

                        // if (luckyCount >= 5) {
                        //     setRandomEffects(
                        //         new Array(effectCount)
                        //             .fill(0)
                        //             .map(getRandomEffect)
                        //             .map((EFFECT) => EFFECT.label)
                        //     );
                        //     setLuckyCount((prev) => prev - 5);
                        // }
                    }}>
                    购买刮刮乐(${ticketPrice})，刮出{numCount}个数字
                </button>
                {!!nums.length && (
                    <>
                        <div>你刮出了数字：{nums.join(', ')}</div>
                        <div>收益：{award}</div>
                    </>
                )}
            </fieldset>
        </>
    );
}

export default App;
