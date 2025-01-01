import type Runtype from "../Runtype.ts"

const unwrapTrivial = (runtype: Runtype): Runtype => {
	switch (runtype.tag) {
		case "brand":
			return unwrapTrivial(runtype.entity as Runtype)
		case "intersect":
			if (runtype.intersectees.length === 1)
				return unwrapTrivial(runtype.intersectees[0] as Runtype)
			break
		case "union":
			if (runtype.alternatives.length === 1)
				return unwrapTrivial(runtype.alternatives[0] as Runtype)
			break
	}
	return runtype
}

export default unwrapTrivial